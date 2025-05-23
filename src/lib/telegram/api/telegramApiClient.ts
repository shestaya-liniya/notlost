import { Api, TelegramClient } from "telegram";
//import { StringSession } from "telegram/sessions";
import bigInt from "big-integer";
import Photo = Api.Photo;
import { Buffer } from "buffer/";
import { StringSession } from "telegram/sessions";

class TelegramApiClient {
  private static instance: TelegramApiClient;

  private client: TelegramClient;
  private apiId: number;
  private apiHash: string;

  private avatarsQueue: (() => Promise<void>)[] = [];
  private downloadedAvatars = 0;
  private isProcessingInAvatarQueue = false;
  private inFlightAvatarPromises: Map<string, Promise<Buffer>> = new Map();

  private constructor(
    api_id: number,
    api_hash: string,
    string_session: string
  ) {
    this.apiId = Number(api_id);
    this.apiHash = api_hash;

    this.client = new TelegramClient(
      new StringSession(string_session),
      Number(api_id),
      api_hash,
      {
        connectionRetries: 5,
      }
    );
  }

  public async initialize(): Promise<void> {
    try {
      if (!this.client.connected) {
        await this.client.connect();
        console.log("Telegram client connected.");
      }
    } catch (error) {
      console.error("Failed to connect Telegram client:", error);
      throw error;
    }
  }

  public async sendSignInCode(phoneNumber: string): Promise<boolean> {
    console.log("send code func");

    await this.initialize();
    try {
      await this.client.sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        phoneNumber
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async generateQrLink(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.signInUserWithQrCode(
        {
          apiId: Number(import.meta.env.VITE_TELEGRAM_API_ID),
          apiHash: import.meta.env.VITE_TELEGRAM_API_HASH,
        },
        {
          onError: async function (e: Error): Promise<boolean> {
            console.log(e);
            reject(e);
            return true;
          },
          qrCode: async (code): Promise<void> => {
            const tokenUrl = `tg://login?token=${code.token.toString("base64")}`;
            console.log(tokenUrl);
            resolve(tokenUrl);
          },
        }
      );
    });
  }
  public async signIn(
    phoneNumber: string,
    password: string,
    phoneCode: string,
    onSuccess: (session: string) => void
  ): Promise<string | void | Error> {
    try {
      await this.client.start({
        phoneNumber,
        password: userAuthParamCallback(password),
        phoneCode: userAuthParamCallback(phoneCode),
        onError: (e) => {
          throw new Error(e.message);
        },
      });

      onSuccess(this.getSession());
    } catch (e) {
      console.log(e);

      if (e instanceof Error) {
        return e;
      } else {
        return new Error("Unknown error occurred");
      }
    }
  }

  public async signInWithPassword(
    password: string,
    onSuccess: (session: string) => void
  ) {
    try {
      await this.client.signInWithPassword(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        {
          password: async () => password,
          onError: (e) => {
            throw new Error(e.message);
          },
        }
      );

      onSuccess(this.getSession());
    } catch (e) {
      console.log(e);

      if (e instanceof Error) {
        return e;
      } else {
        return new Error("Unknown error occurred");
      }
    }
  }

  public getSession(): string {
    return JSON.stringify(this.client.session.save());
  }

  async getPhoto(username: string): Promise<Buffer> {
    if (this.inFlightAvatarPromises.has(username)) {
      return this.inFlightAvatarPromises.get(username)!;
    }

    const avatarPromise = new Promise<Buffer>((resolve, reject) => {
      const task = async () => {
        try {
          await this.initialize();

          if (this.downloadedAvatars % 4 === 0 && this.downloadedAvatars !== 0)
            // TODO: sometime api return api rate limit exceed, catch time to wait before retry, 10 seconds is a default
            await new Promise((resolve) => setTimeout(resolve, 0));
          this.downloadedAvatars += 1;

          const result = await this.client.invoke(
            new Api.photos.GetUserPhotos({
              userId: username,
            })
          );

          const photo = result.photos[0] as Photo;
          const fr = photo.fileReference;

          const res = await this.client.downloadFile(
            new Api.InputPhotoFileLocation({
              id: photo.id,
              accessHash: photo.accessHash,
              fileReference: fr,
              thumbSize: "c",
            }),
            {
              dcId: photo.dcId,
              fileSize: bigInt(829542),
            }
          );

          if (Buffer.isBuffer(res)) {
            resolve(res);
          } else {
            throw new Error("Failed to download photo as a Buffer");
          }
        } catch (error) {
          reject(error);
        } finally {
          this.inFlightAvatarPromises.delete(username);
          this.processQueue();
        }
      };
      this.avatarsQueue.push(task);

      if (!this.isProcessingInAvatarQueue) {
        this.processQueue();
      }
    });

    this.inFlightAvatarPromises.set(username, avatarPromise);

    return avatarPromise;
  }

  async getUserByUsername(username: string) {
    await this.initialize();
    this.getDialogs();
    const result = await this.client.invoke(
      new Api.users.GetUsers({
        id: [username],
      })
    );
    return result;
  }

  async getDialogs() {
    await this.initialize();
    const dialogs = await this.client.getDialogs({ archived: false });

    return dialogs;
  }

  async getFullChannel(channelUsername: string) {
    await this.initialize();
    const channelInfo = await this.client.invoke(
      new Api.channels.GetFullChannel({
        channel: channelUsername,
      })
    );

    return channelInfo;
  }

  private async processQueue(): Promise<void> {
    if (this.avatarsQueue.length === 0) {
      this.isProcessingInAvatarQueue = false;
      return;
    }

    this.isProcessingInAvatarQueue = true;
    const nextTask = this.avatarsQueue.shift();
    if (nextTask) {
      await nextTask();
    }
  }

  public static getInstance(
    api_id: number,
    api_hash: string,
    string_session: string
  ) {
    if (!TelegramApiClient.instance) {
      TelegramApiClient.instance = new TelegramApiClient(
        api_id,
        api_hash,
        string_session
      );
    }
    return TelegramApiClient.instance;
  }
}

function userAuthParamCallback<T>(param: T): () => Promise<T> {
  return async function () {
    return await new Promise<T>((resolve) => {
      resolve(param);
    });
  };
}

export interface TelegramDialogInfo {
  id: bigInt.BigInteger;
  label: string;
  username: string;
  unreadCount: number;
}

export default TelegramApiClient;

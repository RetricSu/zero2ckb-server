import { Application } from "express";

const logger = {
  error: (err: Error | string) => {
    console.log(err);
  },
  info: (err: Error | string) => {
    console.log(err);
  },
  debug: (err: Error | string) => {
    console.log(err);
  },
  warning: (err: Error | string) => {
    console.log(err);
  },
};

export enum HttpProtocolMethod {
  get = "GET",
  post = "POST",
  all = "POST, GET",
  option = "OPTION",
}
export type HttpRequestCallMethod = (req: any, res: any) => any;

export enum SpecialRouterHeader {
  dynamic = "dynamic_router_",
}

export interface DynamicRouterCheckResult {
  isDynamic: boolean;
  url: string;
}

export function getMethodNames(mod: any): string[] {
  return Object.getOwnPropertyNames(mod.prototype).filter(
    (name) => name !== "constructor" && name !== "initRequest"
  );
}

export const setUrlTargetMethod = async (
  app: Application,
  target: string,
  method: HttpRequestCallMethod,
  request_type: HttpProtocolMethod = HttpProtocolMethod.get
) => {
  const url = `/${target}`;
  const executeMethod = async (
    req: any,
    res: { send: (arg0: { status: string; data?: any; error?: any }) => void }
  ) => {
    logger.info(
      `[http-server] /${target}, query: ${JSON.stringify(
        req.query,
        null,
        0
      ).replace(/\\/g, "")}, params: ${JSON.stringify(
        req.params,
        null,
        0
      ).replace(/\\/g, "")}\n`
    );
    try {
      const return_data = await method(req, res);
      res.send({ status: "ok", data: return_data });
    } catch (error: any) {
      logger.error(error.message);
      res.send({ status: "failed", error: error.message });
    }
  };
  switch (request_type) {
    case HttpProtocolMethod.get:
      app.get(url, async (req: any, res: any) => {
        await executeMethod(req, res);
      });
      break;

    case HttpProtocolMethod.post:
      app.post(url, async (req: any, res: any) => {
        await executeMethod(req, res);
      });
      break;

    default:
      throw new Error(`unknown request type, required ${HttpProtocolMethod}`);
  }
};

export const setUpRouters = async (
  app: Application,
  service: Service,
  mod: typeof Service
) => {
  const bassServiceMethods: string[] = getMethodNames(Service); //public method like ping
  const method_names: string[] = getMethodNames(mod).concat(bassServiceMethods);
  for (let name of method_names) {
    // process special router
    const target_url = name === "default" ? "" : name; // default = url "/" home page
    const { isDynamic, url } = toDynamicRouter(target_url);

    const method = async (req: any, res: any) => {
      await service.initRequest(req, res);
      if (isDynamic) {
        return (service as any)[name](req.params.arg);
      }

      return (service as any)[name]();
    };

    const httpType =
      (service as any)[name].httpProtocolMethod || HttpProtocolMethod.get;
    logger.info(`setup url => /${url}, [ ${httpType} ]`);
    switch (httpType) {
      case HttpProtocolMethod.get:
        await setUrlTargetMethod(app, url, method, HttpProtocolMethod.get);
        break;

      case HttpProtocolMethod.post:
        await setUrlTargetMethod(app, url, method, HttpProtocolMethod.post);
        break;

      default:
        throw new Error(`un-supported HttpProtocolMethod, ${httpType}`);
    }
  }
  logger.info("---");
};

export const toDynamicRouter = (url: string): DynamicRouterCheckResult => {
  // dynamic_router_article to /article/:id
  if (url.startsWith(SpecialRouterHeader.dynamic)) {
    const dUrl = url.split(SpecialRouterHeader.dynamic)[1];
    return { isDynamic: true, url: `${dUrl}/:arg` };
  }
  return { isDynamic: false, url: url };
};

//#### Decorator function
export function readonly(target: any, name: any, descriptor: any) {
  descriptor.writable = false;
  return descriptor;
}

// http url method allowed: [get, post, options...]
export function allowType(value: HttpProtocolMethod = HttpProtocolMethod.get) {
  return function (target: any, name: any, _descriptor: any) {
    target[name].httpProtocolMethod = value;
  };
}

export class Service {
  public req;
  public res;
  public name: string;

  constructor(name: string, req?: any, res?: any) {
    this.req = req;
    this.res = res;
    this.name = name;
  }

  async initRequest(req: any, res: any) {
    this.req = req;
    this.res = res;
  }

  // default home page router: http://xxxxxx:port/
  default() {
    return `you just reach ${this.name}.`;
  }

  ping() {
    return "pong";
  }
}

import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  exports: [HttpModule],
})
export class HttpModuleOverride implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public onModuleInit(): any {
    // Add request interceptor and response interceptor to log request infos
    const axios = this.httpService.axiosRef;
    axios.interceptors.request.use((config) => {
      // Please don't tell my Typescript compiler...
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.metadata = { ...config.metadata, startDate: new Date() };
      return config;
    });
    axios.interceptors.response.use(
      (response) => {
        const { config } = response;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.metadata = { ...config.metadata, endDate: new Date() };
        // const duration = config['metadata'].endDate.getTime() - config['metadata'].startDate.getTime();
        // Log some request infos (you can actually extract a lot more if you want: the content type, the content size, etc.)
        // console.log(`${config?.method?.toUpperCase()} ${config?.url} ${duration}ms`);

        return response;
      },
      (err) => {
        console.error(err);

        // Don't forget this line like I did at first: it makes your failed HTTP requests resolve with "undefined" :-(
        return Promise.reject(err);
      },
    );
  }
}

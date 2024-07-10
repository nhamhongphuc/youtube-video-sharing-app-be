import { IsString } from 'class-validator';

export class ShareVideoPayloadDto {
  @IsString()
  url: string;
}

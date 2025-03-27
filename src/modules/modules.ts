import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { VoyagerController } from './voyager/voyager.controller';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [VoyagerController],
  providers: [],
})
export class Modules {}

import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Biometric key must be a string' })
  biometricKey?: string;
}

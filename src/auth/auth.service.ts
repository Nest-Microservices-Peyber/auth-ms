import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';

import * as bcrypt from 'bcrypt';

import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit{
    private readonly logger = new Logger('AuthService'); 

    onModuleInit() {
        this.$connect();
        this.logger.log('Connected to the database AuthDB successfully');
    }

    constructor(
        private readonly jwtService: JwtService
    ) {
        super();
    }

    async signJWT(payload: JwtPayload){
        return this.jwtService.sign(payload);
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        const {emai, name, password} = registerUserDto
        try {
            const user = await this.user.findUnique({
                where: {
                    email: emai
                }
            })

            if(user) {
                throw new RpcException({
                    code: 400,
                    message: 'User already exists'
                })
            }

            
            const newUser = await this.user.create({
                data: {
                    email: emai,
                    name,
                    password: bcrypt.hashSync(password, 10) //* encriptar 
                }
            })

            const {password: __, ...rest} = newUser;

            return {
                user: rest,
                token: await this.signJWT(rest)
            };
        } catch (error) {
            throw new RpcException({
                code: 400,
                message: error.message
            });
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const {emai, password} = loginUserDto
        try {
            const user = await this.user.findUnique({
                where: {
                    email: emai
                }
            })

            if(!user) {
                throw new RpcException({
                    code: 400,
                    message: 'User/Password not valid'
                })
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                throw new RpcException({
                    code: 400,
                    message: 'User/Password not valid'
                })
            }
            
            const {password: __, ...rest} = user;

            return {
                user: rest,
                token: await this.signJWT(rest)
            };
        } catch (error) {
            throw new RpcException({
                code: 400,
                message: error.message
            });
        }
    }

}

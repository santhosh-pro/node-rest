import { AuthService } from '@app/auth/auth.service';
import config from '@app/config';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import jwt_decode from "jwt-decode";

jest.mock('jwt-decode', () => ({
    default: jest.fn().mockReturnValue({
        iss: '/tenantName',
        exp: 'exp-time',
        realm_access: {
            roles: 'mockRole'
        }
    })
}));

describe('Testing Auth Service', () => {
    let authService: AuthService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: [`${process.cwd()}/config/.env`],
                    isGlobal: true,
                    expandVariables: true,
                    load: config,
                }),
            ],
            providers: [AuthService],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    it('Testing "getAccessToken"', async () => {
        const body = {
            username: 'string',
            password: 'string',
            tenantName: 'string',
            clientId: 'clientId',
            clientSecret: 'clientSecret'
        }

        const mockAcessToken = jest.spyOn(axios, 'post').mockResolvedValue('access-token');
        const response = await authService.getAccessToken(body);

        expect(mockAcessToken).toHaveBeenCalled();
        expect(response).toEqual('access-token');
        mockAcessToken.mockRestore();
    });

    it('Testing "logout"', async () => {
        const body = {
            tenantName: 'string',
            refreshToken: 'string',
            clientId: 'clientId',
            clientSecret: 'clientSecret'
        }

        const mockLogOut = jest.spyOn(axios, 'post').mockResolvedValue({ status: 204 });
        const response = await authService.logout(body);

        expect(mockLogOut).toHaveBeenCalled();
        expect(response).toEqual(204);
        mockLogOut.mockRestore();
    });

    it('Testing "refreshAccessToken"', async () => {
        const body = {
            tenantName: 'string',
            refreshToken: 'string',
            clientId: 'clientId',
            clientSecret: 'clientSecret'
        }

        const mockrefreshAccessToken = jest.spyOn(axios, 'post').mockResolvedValue('access-token');
        const response = await authService.refreshAccessToken(body);

        expect(mockrefreshAccessToken).toHaveBeenCalled();
        expect(response).toEqual('access-token');
        mockrefreshAccessToken.mockRestore();
    });

    it('Testing "validateToken"', async () => {
        const mockvalidateToken = jest.spyOn(axios, 'post').mockResolvedValue({ data: { active: true } });
        const response = await authService.validateToken('string', 'string', 'string');

        expect(mockvalidateToken).toHaveBeenCalled();
        expect(response).toEqual(true);
        mockvalidateToken.mockRestore();
    });

    it('Testing "getTenantName"', async () => {
        const response = await authService.getTenantName('string');

        expect(jwt_decode).toHaveBeenCalled();
        expect(response).toEqual('tenantName');
    });

    it('Testing "getExpTime"', async () => {
        const response = await authService.getExpTime('string');

        expect(jwt_decode).toHaveBeenCalled();
        expect(response).toEqual('exp-time');
    });

    it('Testing "getUserRoles"', async () => {
        const response = await authService.getUserRoles('string');

        expect(jwt_decode).toHaveBeenCalled();
        expect(response).toEqual('mockRole');
    });
});

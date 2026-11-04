export interface RegisterUserInputDTO {
    name: string;
    email: string;
    password: string;
}
export interface RegisterUserOutputDTO {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
}
export interface LoginInputDTO {
    email: string;
    password: string;
}
export interface LoginOutputDTO {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}
//# sourceMappingURL=AuthDTOs.d.ts.map
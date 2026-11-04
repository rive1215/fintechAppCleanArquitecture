export interface UserProps {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    createdAt: Date;
}
export declare class User {
    private readonly props;
    private constructor();
    static create(props: UserProps): User;
    get id(): string;
    get email(): string;
    get passwordHash(): string;
    get fullName(): string;
    get createdAt(): Date;
}
//# sourceMappingURL=User.d.ts.map
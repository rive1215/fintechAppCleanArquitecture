import { DomainError, InvalidPropValueError } from '../exceptions/DomainError';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: Date;
}

export class User {
  private readonly props: UserProps;

  // Constructor privado: Fuerza a los desarrolladores a usar el método estático create()
  private constructor(props: UserProps) {
    this.props = props;
  }

  public static create(props: UserProps): User {
    // Invariante de Dominio: Un usuario no puede existir con un correo mal formado
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      throw new InvalidPropValueError('El formato del correo electrónico es estructuralmente inválido.');
    }
    return new User(props);
  }

  // Getters puros. Exponemos la información sin permitir que la muten desde afuera.
  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get fullName(): string { return this.props.fullName; }
  get createdAt(): Date { return this.props.createdAt; }
}
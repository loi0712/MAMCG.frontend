type Department = {
    id: number;
    name: string | null;
    description: string | null;
};

type Position = {
    id: number;
    name: string | null;
    description: string | null;
};

export type AuthUser = {
    id: string;
    username: string;
    password: string | null;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    address: string | null;
    department: Department;
    position: Position;
    imageUrl: string | null;
    isActive: boolean;
};

export type AuthResponse = {
    user: AuthUser;
    token: string;
};

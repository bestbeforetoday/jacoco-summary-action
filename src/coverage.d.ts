export interface Coverage {
    instruction: number;
    branch: number;
    line: number;
    complexity: number;
    method: number;
    class: number;
    packages: Package[];
}

export interface Package {
    name: string;
    instruction: number;
    branch: number;
    line: number;
    complexity: number;
    method: number;
    class: number;
    classes: Class[];
}

export interface Class {
    name: string;
    instruction: number;
    branch: number;
    line: number;
    complexity: number;
    method: number;
    class: number;
}

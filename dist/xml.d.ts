import { Class, Coverage, Package } from './coverage';
interface ReportSchema {
    package?: PackageSchema | PackageSchema[];
    counter?: Counter | Counter[];
}
interface PackageSchema {
    '@_name': string;
    counter?: Counter | Counter[];
    class?: ClassSchema | ClassSchema[];
}
interface Counter {
    '@_type': string;
    '@_missed': string;
    '@_covered': string;
}
interface ClassSchema {
    '@_name': string;
    counter?: Counter | Counter[];
}
export declare function fromXml(xml: Buffer): XmlCoverage;
declare class XmlCoverage implements Coverage {
    #private;
    constructor(report: ReportSchema);
    get packages(): XmlPackage[];
    get instruction(): number;
    get branch(): number;
    get line(): number;
    get complexity(): number;
    get method(): number;
    get class(): number;
}
declare class XmlPackage implements Package {
    #private;
    constructor(packageElement: PackageSchema);
    get name(): string;
    get instruction(): number;
    get branch(): number;
    get line(): number;
    get complexity(): number;
    get method(): number;
    get class(): number;
    get classes(): XmlClass[];
}
declare class XmlClass implements Class {
    #private;
    constructor(classElement: ClassSchema);
    get name(): string;
    get instruction(): number;
    get branch(): number;
    get line(): number;
    get complexity(): number;
    get method(): number;
    get class(): number;
}
export {};

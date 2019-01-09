import { UUID } from "@app/common/utils";

export const randomId = (): string => Math.random().toString(36).slice(2, 12);

export class Random {
    public static get id() {
        return randomId();
    }

    public static get uuid() {
        return UUID.random();
    }
}

export { Random as random }
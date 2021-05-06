type Type = "rest" | "dish";

export interface IResultFindRestaurantOrDishByName {
    id: number;
    name: string;
    revl: number;
    type: Type;
    restId?: number;
}
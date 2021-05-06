

export interface IResponseBodyRestaurant {
    id: number;
    name: string;
    cashBalance: number;
    weekDay?: number;
    startTime?: string;
    endTime?: string;
}

export interface IResponseBodyRestaurantWithOpeningHour {
    id: number;
    name: string;
    cashBalance: number;
    weekDay: number;
    startTime: string;
    endTime: string;
}

export interface IResponseBodyRestaurantOrDish {
    id: number;
    name: string;
    type: string;
    restId?: number;
}
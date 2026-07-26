import {

    completePromotion,

} from "@/features/chess/promotion";

import {

    usePromotionStore,

} from "@/features/chess/promotion";

export function usePromotion() {

    const state =

        usePromotionStore();

    return {

        ...state,

        promote:

            completePromotion,

    };

}
import type { MatchOffer } from "@/shared/types/offer";

export async function fetchOffers(): Promise<MatchOffer[]> {

    return [

        {

            id: 1,

            creatorId: 1,

            creatorName: "Mohammad",

            stake: 1,

            currency: "TON",

            timeControl: "5+0",

            rated: true,

            createdAt: new Date().toISOString(),

        },

        {

            id: 2,

            creatorId: 2,

            creatorName: "Alex",

            stake: 5,

            currency: "TON",

            timeControl: "3+2",

            rated: false,

            createdAt: new Date().toISOString(),

        },

    ];

}
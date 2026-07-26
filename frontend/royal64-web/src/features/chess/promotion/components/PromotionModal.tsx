import {

    Stack,

    Button,

    Card,

    Text,

} from "@/shared/ui";

import {

    usePromotion,

} from "@/features/chess/promotion";

export function PromotionModal() {

    const {

        open,

        promote,

    } =

        usePromotion();

    if (

        !open

    ) {

        return null;

    }

    return (

        <Card>

            <Stack gap={12}>

                <Text variant="h2">

                    Promotion

                </Text>

                <Button

                    onClick={() =>

                        promote("q")

                    }

                >

                    Queen

                </Button>

                <Button

                    onClick={() =>

                        promote("r")

                    }

                >

                    Rook

                </Button>

                <Button

                    onClick={() =>

                        promote("b")

                    }

                >

                    Bishop

                </Button>

                <Button

                    onClick={() =>

                        promote("n")

                    }

                >

                    Knight

                </Button>

            </Stack>

        </Card>

    );

}
import { AppProviders } from "./providers/AppProviders";

import { AppLayout } from "./layout/AppLayout";

import { HomePage } from "@/pages/home";

export function App(){

    return(

        <AppProviders>

            <AppLayout>

                <HomePage/>

            </AppLayout>

        </AppProviders>

    )

}
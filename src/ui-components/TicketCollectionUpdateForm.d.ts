/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps } from "@aws-amplify/ui-react";
import { TicketCollection } from "../API.ts";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TicketCollectionUpdateFormInputValues = {};
export declare type TicketCollectionUpdateFormValidationValues = {};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TicketCollectionUpdateFormOverridesProps = {
    TicketCollectionUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
} & EscapeHatchProps;
export declare type TicketCollectionUpdateFormProps = React.PropsWithChildren<{
    overrides?: TicketCollectionUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    ticketCollection?: TicketCollection;
    onSubmit?: (fields: TicketCollectionUpdateFormInputValues) => TicketCollectionUpdateFormInputValues;
    onSuccess?: (fields: TicketCollectionUpdateFormInputValues) => void;
    onError?: (fields: TicketCollectionUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TicketCollectionUpdateFormInputValues) => TicketCollectionUpdateFormInputValues;
    onValidate?: TicketCollectionUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TicketCollectionUpdateForm(props: TicketCollectionUpdateFormProps): React.ReactElement;

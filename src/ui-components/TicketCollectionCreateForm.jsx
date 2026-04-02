/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SelectField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createTicketCollection } from "../graphql/mutations";
const client = generateClient();
export default function TicketCollectionCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    owner: "",
    title: "",
    description: "",
    visibility: "",
    sort: "",
    ticketCount: "",
  };
  const [owner, setOwner] = React.useState(initialValues.owner);
  const [title, setTitle] = React.useState(initialValues.title);
  const [description, setDescription] = React.useState(
    initialValues.description
  );
  const [visibility, setVisibility] = React.useState(initialValues.visibility);
  const [sort, setSort] = React.useState(initialValues.sort);
  const [ticketCount, setTicketCount] = React.useState(
    initialValues.ticketCount
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setOwner(initialValues.owner);
    setTitle(initialValues.title);
    setDescription(initialValues.description);
    setVisibility(initialValues.visibility);
    setSort(initialValues.sort);
    setTicketCount(initialValues.ticketCount);
    setErrors({});
  };
  const validations = {
    owner: [{ type: "Required" }],
    title: [],
    description: [],
    visibility: [{ type: "Required" }],
    sort: [],
    ticketCount: [{ type: "Required" }],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          owner,
          title,
          description,
          visibility,
          sort,
          ticketCount,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createTicketCollection.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "TicketCollectionCreateForm")}
      {...rest}
    >
      <TextField
        label="Owner"
        isRequired={true}
        isReadOnly={false}
        value={owner}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              owner: value,
              title,
              description,
              visibility,
              sort,
              ticketCount,
            };
            const result = onChange(modelFields);
            value = result?.owner ?? value;
          }
          if (errors.owner?.hasError) {
            runValidationTasks("owner", value);
          }
          setOwner(value);
        }}
        onBlur={() => runValidationTasks("owner", owner)}
        errorMessage={errors.owner?.errorMessage}
        hasError={errors.owner?.hasError}
        {...getOverrideProps(overrides, "owner")}
      ></TextField>
      <TextField
        label="Title"
        isRequired={false}
        isReadOnly={false}
        value={title}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              owner,
              title: value,
              description,
              visibility,
              sort,
              ticketCount,
            };
            const result = onChange(modelFields);
            value = result?.title ?? value;
          }
          if (errors.title?.hasError) {
            runValidationTasks("title", value);
          }
          setTitle(value);
        }}
        onBlur={() => runValidationTasks("title", title)}
        errorMessage={errors.title?.errorMessage}
        hasError={errors.title?.hasError}
        {...getOverrideProps(overrides, "title")}
      ></TextField>
      <TextField
        label="Description"
        isRequired={false}
        isReadOnly={false}
        value={description}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              owner,
              title,
              description: value,
              visibility,
              sort,
              ticketCount,
            };
            const result = onChange(modelFields);
            value = result?.description ?? value;
          }
          if (errors.description?.hasError) {
            runValidationTasks("description", value);
          }
          setDescription(value);
        }}
        onBlur={() => runValidationTasks("description", description)}
        errorMessage={errors.description?.errorMessage}
        hasError={errors.description?.hasError}
        {...getOverrideProps(overrides, "description")}
      ></TextField>
      <SelectField
        label="Visibility"
        placeholder="Please select an option"
        isDisabled={false}
        value={visibility}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              owner,
              title,
              description,
              visibility: value,
              sort,
              ticketCount,
            };
            const result = onChange(modelFields);
            value = result?.visibility ?? value;
          }
          if (errors.visibility?.hasError) {
            runValidationTasks("visibility", value);
          }
          setVisibility(value);
        }}
        onBlur={() => runValidationTasks("visibility", visibility)}
        errorMessage={errors.visibility?.errorMessage}
        hasError={errors.visibility?.hasError}
        {...getOverrideProps(overrides, "visibility")}
      >
        <option
          children="Public"
          value="PUBLIC"
          {...getOverrideProps(overrides, "visibilityoption0")}
        ></option>
        <option
          children="Private"
          value="PRIVATE"
          {...getOverrideProps(overrides, "visibilityoption1")}
        ></option>
      </SelectField>
      <SelectField
        label="Sort"
        placeholder="Please select an option"
        isDisabled={false}
        value={sort}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              owner,
              title,
              description,
              visibility,
              sort: value,
              ticketCount,
            };
            const result = onChange(modelFields);
            value = result?.sort ?? value;
          }
          if (errors.sort?.hasError) {
            runValidationTasks("sort", value);
          }
          setSort(value);
        }}
        onBlur={() => runValidationTasks("sort", sort)}
        errorMessage={errors.sort?.errorMessage}
        hasError={errors.sort?.hasError}
        {...getOverrideProps(overrides, "sort")}
      >
        <option
          children="Alphabetical"
          value="ALPHABETICAL"
          {...getOverrideProps(overrides, "sortoption0")}
        ></option>
        <option
          children="Event type"
          value="EVENT_TYPE"
          {...getOverrideProps(overrides, "sortoption1")}
        ></option>
        <option
          children="Event date"
          value="EVENT_DATE"
          {...getOverrideProps(overrides, "sortoption2")}
        ></option>
        <option
          children="Time created"
          value="TIME_CREATED"
          {...getOverrideProps(overrides, "sortoption3")}
        ></option>
      </SelectField>
      <TextField
        label="Ticket count"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={ticketCount}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              owner,
              title,
              description,
              visibility,
              sort,
              ticketCount: value,
            };
            const result = onChange(modelFields);
            value = result?.ticketCount ?? value;
          }
          if (errors.ticketCount?.hasError) {
            runValidationTasks("ticketCount", value);
          }
          setTicketCount(value);
        }}
        onBlur={() => runValidationTasks("ticketCount", ticketCount)}
        errorMessage={errors.ticketCount?.errorMessage}
        hasError={errors.ticketCount?.hasError}
        {...getOverrideProps(overrides, "ticketCount")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}

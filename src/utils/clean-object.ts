export type CustomObject = {
  [key: string]: string | number | string[] | number[] | null | undefined;
};

export const cleanObject = (params: CustomObject): CustomObject => {
  const returnObject: CustomObject = {};

  Object.keys(params).forEach(key => {
    const value = params[key as keyof CustomObject];

    if (value !== null && value !== undefined && (value as string) !== '') {
      returnObject[key] = value;
    }
  });

  return returnObject;
};

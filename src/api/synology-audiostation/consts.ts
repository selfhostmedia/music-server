/* eslint-disable max-len */
export const AUTHENTICATED_REQUEST_DESCRIPTION = `The request must be authenticated using a valid Synology session ID and device ID cookie for the user, which can be obtained by signing in via the \`entry.cgi\` endpoint, a two-step process requesting the encryption public key from \`/certs\` and then  submitting credentials encrypted with it.`;

export const PAGINATED_DATA_DESCRIPTION = `The data is returned in a paginated format, with the ability to specify an offset and limit for the results, where the offset indicates the starting point in the list and the limit specifies the maximum number of items to return.`;

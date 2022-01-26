export {
	defaultStoreValue,
	RequestStatus,
	type RequestParameters,
	type RequestResult
} from '@kitql/client';
import { KitQLClient } from '@kitql/client';

export const kitQLClient = new KitQLClient({
	url: `https://countries.trevorblades.com/graphql`
});

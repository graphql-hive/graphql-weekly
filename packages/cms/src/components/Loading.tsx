import { Center } from "./Center";
import { Padder } from "./Padder";
import { Spinner } from "./Spinner";

export function Loading() {
  return (
    <Center>
      <Padder>
        <Spinner />
      </Padder>
    </Center>
  );
}

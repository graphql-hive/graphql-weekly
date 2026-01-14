import Center from "./Center";
import Padder from "./Padder";
import Spinner from "./Spinner";

export default function Loading() {
  return (
    <Center>
      <Padder>
        <Spinner />
      </Padder>
    </Center>
  );
}

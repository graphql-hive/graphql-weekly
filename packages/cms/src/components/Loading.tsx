import Center from "./Center"
import Spinner from "./Spinner"
import Padder from "./Padder"

export default function Loading() {
  return (
    <Center>
      <Padder>
        <Spinner />
      </Padder>
    </Center>
  )
}

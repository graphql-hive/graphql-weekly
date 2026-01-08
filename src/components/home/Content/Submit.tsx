import * as React from 'react'

import { PrimaryButton } from '../../shared/Buttons/Index'
import Mail from '../../vectors/Mail'

type Props = {
  submitModalClickHandler: Function
}

export const Submit = (props: Props) => {
  return (
    <div className="ml-[23px] max-w-[300px]">
      <div className="-ml-[10px] -mt-8">
        <Mail />
      </div>
      <div className="mt-4 font-medium leading-none text-lg uppercase text-[#9da0b5]">
        Share the goods
      </div>
      <div className="my-3 mb-6 font-medium text-lg leading-6 text-dark">
        Found a cool GraphQL resource? Tell us all about it!
      </div>
      <PrimaryButton
        onClick={() => props.submitModalClickHandler()}
        text="Submit Link"
      />
    </div>
  )
}

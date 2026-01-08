import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { Input } from '../Input/Input'
import { Textarea } from '../Textarea'
import { PrimaryButton, SecondaryButton } from '../Buttons/Index'
import Check from '../../vectors/Check'
import './submit-dialog.css'

export interface SubmitFormHandle {
  showModal: () => void
}

export const SubmitForm = forwardRef<SubmitFormHandle>(function SubmitForm(_, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
  }))

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }

  const showMessageTemporarily = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 5500)
  }

  const formSubmitted = async (e: React.FormEvent) => {
    e.preventDefault()

    if (description && name && email && title && url && !loading) {
      setLoading(true)

      const res = await linkSubmission({ description, name, email, title, url })

      if (res?.data?.createLinkSubmission?.title === title) {
        setIsDone(true)
        setTitle('')
        setUrl('')
        setName('')
        setEmail('')
        setDescription('')
        setLoading(false)
      } else {
        setLoading(false)
        showMessageTemporarily('Error!')
      }
    } else {
      showMessageTemporarily('Empty values!')
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="submit-dialog p-0 bg-transparent max-w-[350px] md:max-w-[600px] w-full"
    >
        <div className="min-h-[200px] box-border pb-10 bg-white border-l-8 border-[#dadbe3] shadow-[0px_4px_16px_rgba(8,17,70,0.5)] rounded-lg w-full [@media(max-height:700px)]:h-full">
          <form onSubmit={formSubmitted} className="flex flex-col h-full">
            {isDone ? (
              <div className="max-h-full overflow-auto flex-auto flex-shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-[#081146]">
                  Submitted for review
                </h2>
              </div>
            ) : (
              <div className="max-h-full overflow-auto flex-auto flex-shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-[#081146]">
                  Submit a new link to the <br />
                  GraphQL Weekly newsletter!
                </h2>
                <div className="h-12 shrink-0" />

                <Input
                  label="Title"
                  placeholder="The Title of The Link"
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="URL"
                  placeholder="http://your-link-address"
                  name="url"
                  onChange={(e) => setUrl(e.target.value)}
                  value={url}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="Name"
                  placeholder="Your Name"
                  name="name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Textarea
                  label="Description"
                  placeholder="Write a small overview of what this link is about..."
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />
              </div>
            )}

            {message && (
              <div className="p-[9px_10px] my-[15px] mx-6 md:mx-12 bg-[#f1f1f4] rounded text-[#424242] text-[15px]">
                {message}
              </div>
            )}
            {isDone ? (
              <div className="flex flex-shrink-0 px-12 justify-center mt-10">
                <SecondaryButton onClick={() => dialogRef.current?.close()}>
                  Close
                </SecondaryButton>
              </div>
            ) : (
              <div className="flex flex-shrink-0 px-12 justify-between mt-[10px]">
                <PrimaryButton
                  text="Submit Link"
                  icon={<Check />}
                  type="submit"
                  disabled={loading}
                />

                <SecondaryButton onClick={() => dialogRef.current?.close()}>
                  Cancel
                </SecondaryButton>
              </div>
            )}
          </form>
        </div>
    </dialog>
  )
})

const linkSubmission = async ({
  description,
  email,
  name,
  title,
  url,
}: {
  description: string
  email: string
  name: string
  title: string
  url: string
}) => {
  const query = `
  mutation createSubmissionLink(
    $description: String!
    $email: String!
    $name: String!
    $title: String!
    $url: String!
  ) {
    createSubmissionLink(
      description: $description,
      email: $email,
      name: $name,
      title: $title,
      url: $url
    ) {
      title
    }
  }
  `

  const variables = { description, email, name, title, url }

  return fetch(
    'https://graphqlweekly-api.netlify.app/.netlify/functions/graphql',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables, operationName: 'createSubmissionLink' }),
    },
  ).then((res) => res.json())
}

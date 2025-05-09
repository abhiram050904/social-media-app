import Profile from '@/components/Profile/Profile'
import React from 'react'

const page = async({params}:{params:Promise<{id:string}>}) => {
    const id=(await (params)).id
  return (
    <div>
      <Profile id={id}/>
    </div>
  )
}

export default page

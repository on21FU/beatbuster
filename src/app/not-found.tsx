import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='error-page container'>
      <h2>404 Ooops!</h2>
      <h3>Looks like you are lost...</h3>
      <p>The page you are looking for is not available</p>
        <a href="/">Return Home</a>
    </div>
  )
}
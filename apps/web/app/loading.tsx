"use client";
import Skeleton from 'react-loading-skeleton'

export default function Loading() {
  return (
    <>
    <Skeleton height={304} />
    <Skeleton circle={true} height={60} width={60} />
    </>
  )
}

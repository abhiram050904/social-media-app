'use client'
import React, { useEffect, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import Link from 'next/link';
import axios from 'axios';
import { BASE_URL } from '@/server';
import { User } from '@/types';
import { handleAuthRequest } from '../utils/apiRequest';
import Image from 'next/image';

type Props = {
  user: User | undefined;
  following: string[] | undefined;
};

const Following = ({ following }: Props) => {
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!following?.length) {
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await Promise.all(
          following.map(async (id) => {
            const getUser = async () => {
              const getUserreq = async () => axios.get(`${BASE_URL}/users/profile/${id}`);
              const result = await handleAuthRequest(getUserreq);
              return result?.data?.data?.user || null;
            };
            return await getUser();
          })
        );

        setFollowingUsers(fetchedUsers.filter(Boolean));
      } catch (error) {
        console.error('Error fetching following users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [following]);

  return (
    <div>
      <Dialog>
        <DialogTrigger>Following</DialogTrigger>
        <DialogContent>
          <DialogTitle>Following</DialogTitle>
          <div className='space-y-4 flex flex-col justify-center items-center mx-auto'>
            {loading ? (
              <p>Loading following users...</p>
            ) : followingUsers.length > 0 ? (
              followingUsers.map((followingUser) => (
                <Link
                  href={`/profile/${followingUser._id}`}
                  key={followingUser._id}
                  className='flex items-center gap-3 w-full px-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md'
                >
                  <Image
                    src={followingUser.profilePicture || '/default-avatar.png'}
                    alt={followingUser.username}
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <span className='text-lg font-medium'>{followingUser.username}</span>
                </Link>
              ))
            ) : (
              <p>Not following anyone yet.</p>
            )}
            <DialogClose>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Following;

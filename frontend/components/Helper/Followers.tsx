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
  followers: string[] | undefined;
};

const Followers = ({ followers }: Props) => {
  const [followerUsers, setFollowerUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!followers?.length) {
      setLoading(false);
      return;
    }

    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await Promise.all(
          followers.map(async (id) => {
            const getUser = async () => {
              const getUserreq = async () => axios.get(`${BASE_URL}/users/profile/${id}`);
              const result = await handleAuthRequest(getUserreq);
              return result?.data?.data?.user || null;
            };
            return await getUser();
          })
        );

        setFollowerUsers(fetchedUsers.filter(Boolean)); 
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [followers]);

  return (
    <div>
      <Dialog>
        <DialogTrigger>Followers</DialogTrigger>
        <DialogContent>
          <DialogTitle>Followers</DialogTitle>
          <div className='space-y-4 flex flex-col justify-center items-center mx-auto'>
            {loading ? (
              <p>Loading followers...</p>
            ) : followerUsers.length > 0 ? (
              followerUsers.map((follower) => (
                <Link href={`/profile/${follower._id}`} key={follower._id} className='flex items-center gap-3 w-full px-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md'>
                  <Image
                    src={follower.profilePicture || '/default-avatar.png'}
                    alt={follower.username}
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <span className='text-lg font-medium'>{follower.username}</span>
                </Link>
              ))
            ) : (
              <p>No followers yet.</p>
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

export default Followers;

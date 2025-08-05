"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState, use } from 'react';
import Pagination from 'react-js-pagination';
import { useAppSelector } from '../../../redux/hooks';
import { selectUser } from '../../../redux/session/sessionSlice';
import micropostApi, { Micropost } from '../../../components/shared/api/micropostApi';
import relationshipApi from '../../../components/shared/api/relationshipApi';
import userApi, { UserShow } from '../../../components/shared/api/userApi';
import flashMessage from '../../../components/shared/flashMessages';
import FollowForm from '../../../components/users/FollowForm';
import Link from 'next/link';

const Show = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const [user, setUser] = useState<UserShow | null>(null);
  const [microposts, setMicroposts] = useState<Micropost[]>([]);
  const [idRelationships, setIdRelationships] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const current_user = useAppSelector(selectUser);
  const router = useRouter();
  const id = params.id;

  const setWall = useCallback(async () => {
    try {
      const response = await userApi.show(params.id, { page });
      if (response.microposts) {
        setUser(response.user);
        setMicroposts(response.microposts);
        setTotalCount(response.total_count);
        setIdRelationships(id);
      } else {
        setUser(null);
        setMicroposts([]);
      }
    } catch (error) {
      console.log(error);
    }
  }, [page, id, params.id]);

  useEffect(() => {
    if (id) {
      setWall();
    }
  }, [setWall, id]);

  const handlePageChange = (pageNumber: React.SetStateAction<number>) => {
    setPage(pageNumber);
  };

  const handleFollow = async (e: { preventDefault: () => void })  => {
    e.preventDefault();
    try {
      const response = await relationshipApi.create({ followed_id: id });
      if (response.follow) {
        setWall();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnfollow = async (e: { preventDefault: () => void })  => {
    e.preventDefault();
    try {
      const response = await relationshipApi.destroy(id);
      if (response.unfollow) {
        setWall();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeMicropost = async (micropostId: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await micropostApi.remove(micropostId);
        if (response.flash) {
          flashMessage(...response.flash);
          setWall();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="row">
      <aside className="col-md-4">
        <section>
          <h1>
            <Image
              className={"gravatar"}
              src={`https://secure.gravatar.com/avatar/${user.gravatar_id}?s=${user.size}`}
              alt="Example User"
              width={50}
              height={50}
              priority
            />
            {user.name}
          </h1>
        </section>
        <section className="stats">
          <div className="stats">
            <Link href={`/users/${user.id}/following`}>
              <strong id="following" className="stat">
                {user.following}
              </strong>
              following
            </Link>
            <Link href={`/users/${user.id}/followers`}>
              <strong id="followers" className="stat">
                {user.followers}
              </strong>
              followers
            </Link>
          </div>
        </section>
      </aside>

      <div className="col-md-8">
        {current_user && current_user?.value?.id !== id && (
          <FollowForm
            id={id}
            user={user}
            handleUnfollow={handleUnfollow}
            handleFollow={handleFollow}
          />
        )}
        {microposts.length > 0 && (
          <>
            <h3>{`Microposts (${totalCount})`}</h3>
            <ol className="microposts">
              {microposts.map((micropost, index) => (
                <li key={index} id={`micropost-${micropost.id}`}>
                  <Link href={`/users/${user.id}`}>
                    <Image
                      className={"gravatar"}
                      src={`https://secure.gravatar.com/avatar/${micropost.gravatar_id}?s=50`}
                      alt={user.name}
                      width={50}
                      height={50}
                      priority
                    />
                  </Link>
                  <span className="user">
                    <Link href={`/users/${micropost.user_id}`}>{user.name}</Link>
                  </span>
                  <span className="content">
                    {micropost.content}
                    {micropost.image && (
                      <Image
                        src={micropost.image}
                        alt="Example User"
                        width={50}
                        height={50}
                        priority
                      />
                    )}
                  </span>
                  <span className="timestamp">
                    {`Posted ${micropost.timestamp} ago. `}
                    {current_user?.value?.id === micropost.user_id && (
                      <Link href={`#/microposts/${micropost.id}`} onClick={() => removeMicropost(micropost.id)}>
                        delete
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            <Pagination
              activePage={page}
              itemsCountPerPage={5}
              totalItemsCount={totalCount}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Show;

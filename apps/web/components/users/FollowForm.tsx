import React from "react";
import { UserShow } from "../shared/api/userApi";

// export interface FollowFormProps {
//   data: FormData;
//   image: CategoryDetails_category_backgroundImage;
//   onChange: (event: React.ChangeEvent<any>) => void;
//   onImageDelete: () => void;
//   onImageUpload: (file: File) => void;
// }

const FollowForm: React.FC<{
  id: string;
  user: UserShow;
  handleUnfollow: (event: React.ChangeEvent<any>) => void;
  handleFollow: (event: React.ChangeEvent<any>) => void;
}> = ({ id, user, handleUnfollow, handleFollow }) => {
  return (
    <div id="follow_form">
      {
        user.current_user_following_user ? (
          <form
          action={"/relationships/"+id}
          acceptCharset="UTF-8"
          data-remote="true"
          method="post"
          onSubmit={handleUnfollow}
          >
            <input
            type="submit"
            name="commit"
            value="Unfollow"
            className="btn"
            data-disable-with="Unfollow"
            />
          </form>
        ) : (
          <form
          action="/relationships"
          acceptCharset="UTF-8"
          data-remote="true"
          method="post"
          onSubmit={handleFollow}
          >
            <div>
            <input
            type="hidden"
            name="followed_id"
            id="followed_id"
            value={id}
            />
            </div>
            <input
            type="submit"
            name="commit"
            value="Follow"
            className="btn btn-primary"
            data-disable-with="Follow"
            />
          </form>
        )
      }
    </div>
  );
};

export default FollowForm;

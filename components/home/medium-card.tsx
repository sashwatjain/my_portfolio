import { Card, CardBody, Image, Avatar } from "@heroui/react";

export const MediumCard = ({ post }: any) => {
  return (
    <a href={post.link} target="_blank" rel="noopener noreferrer">
      <Card className="border-none h-[380px] md:h-[320px] bg-white/90 dark:bg-black/40 hover:scale-[1.02] transition duration-300">
        
        <CardBody className="p-0 flex flex-col">
          
          <div className="w-full aspect-[16/9] overflow-hidden rounded-t-xl bg-black">
            <Image
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 flex flex-col flex-1">
            
            {/* 🧠 Title */}
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {post.title}
            </h3>

            <span className="text-xs text-green-500 font-medium mb-2">
            Published on Medium
          </span>

            {/* ✍️ Description */}
            <p className="text-sm text-foreground-500 line-clamp-3 mb-4">
              {post.description}...
            </p>

            {/* 👤 Author row */}
            <div className="flex items-center gap-3 mt-auto">
              
              <Avatar
                size="sm"
                src="https://raw.githubusercontent.com/sashwatjain/my_portfolio/main/profile_image.jpg"
                className="ring-2 ring-primary-400 shadow-md"
              />

              <div className="text-xs text-foreground-500">
                <p className="font-medium text-foreground-700">
                  Sashwat Jain
                </p>
                <p>
                  {new Date(post.pubDate).toDateString()}
                </p>
              </div>
            </div>

          </div>
        </CardBody>
      </Card>
    </a>
  );
};
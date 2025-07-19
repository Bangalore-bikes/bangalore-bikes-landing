import Image from "next/image";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    category: "Blog",
    title: "Essential Motorcycle Maintenance Tips",
    description:
      "Keep your bike in top condition with these essential maintenance tips.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1664299568114-70d0d5834d78?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    category: "Blog",
    title: "Best Riding Routes in Bengaluru",
    description: "Discover the best routes for a scenic ride around Bengaluru.",
    imageUrl:
      "https://images.unsplash.com/photo-1602947572401-fc347b48f3da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const LatestFromBlog = () => {
  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center lg:text-start">
          Latest from Blog
        </h2>
        <div className="space-y-16">
          {blogPosts.map((post, index) => (
            <div
              key={post.title}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
            >
              <div
                className={`flex flex-col justify-start text-center lg:text-start h-full ${
                  index % 2 === 0 ? "md:order-1 order-2" : "md:order-2 order-2"
                }`}
              >
                <span className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                  {post.category}
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-6">{post.description}</p>
                <div className="flex justify-center lg:justify-start">
                  <Button className="bg-[#E79F2B] hover:bg-[#E79F2B]/90 text-black">
                    Read More
                  </Button>
                </div>
              </div>
              <div
                className={`relative h-80 w-full rounded-lg overflow-hidden ${
                  index % 2 === 0 ? "md:order-2 order-1" : "md:order-1 order-1"
                }`}
              >
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

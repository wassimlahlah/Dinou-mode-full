import {motion} from "framer-motion";


export default function Loader(){


return (

<div

className="
h-screen
flex
items-center
justify-center
bg-white
"

>


<motion.h1

animate={{
scale:[1,1.2,1]
}}

transition={{
repeat:Infinity,
duration:1
}}

className="
text-5xl
font-serif
"

>

Dinou Moda

</motion.h1>


</div>

)

}
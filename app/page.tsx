1. import { supabase } from "@/lib/supabase";

   export const dynamic = "force-dynamic";

   export default async function Home() {\
   const { data: levels } = await supabase\
   .from("levels")\
   .select("\*")\
   .order("position");

   const categories = [\
   {\
   name: "Primaire",\
   color: "#e8f9e8",\
   icon: "🎓",\
   iconColor: "#239b2c",\
   },\
   {\
   name: "Collège",\
   color: "#e4f2ff",\
   icon: "📚",\
   iconColor: "#0750ad",\
   },\
   {\
   name: "Lycée",\
   color: "#fff2e2",\
   icon: "🎓",\
   iconColor: "#ff851b",\
   },\
   ];

   return (\
   \<main\
   style={{\
   width: "100%",\
   margin: 0,\
   padding: 0,\
   background: "#ffffff",\
   overflow: "hidden",\
   }}\
   \>\
   {/\* HERO IMAGE \*/}\
   \<section\
   style={{\
   width: "100%",\
   margin: 0,\
   padding: 0,\
   overflow: "hidden",\
   lineHeight: 0,\
   }}\
   \>\
   \<img\
   src="/education-hero.png"\
   alt="Bienvenue dans l'espace éducatif de l'Association Massar"\
   style={{\
   display: "block",\
   width: "100%",\
   height: "auto",\
   maxWidth: "100%",\
   objectFit: "contain",\
   objectPosition: "center",\
   margin: 0,\
   padding: 0,\
   }}\
   />\
   \</section>
   ```
     {/* CATEGORIES */}
     <section
       id="niveaux"
       style={{
         width: "100%",
         maxWidth: "1650px",
         margin: "50px auto",
         padding: "0 30px",
         display: "grid",
         gridTemplateColumns:
           "repeat(auto-fit, minmax(320px, 1fr))",
         gap: "25px",
         boxSizing: "border-box",
       }}
     >
       {categories.map((category) => {
         const categoryLevels = (levels || []).filter(
           (level: any) => level.cycle === category.name
         );

         return (
           <div
             key={category.name}
             style={{
               backgroundColor: category.color,
               borderRadius: "28px",
               minHeight: "400px",
               padding: "35px",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               boxSizing: "border-box",
               border: "1px solid #ffffff",
               boxShadow:
                 "0 10px 30px rgba(18,51,122,0.07)",
             }}
           >
             {/* CATEGORY TITLE */}
             <div
               style={{
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 gap: "18px",
                 marginBottom: "30px",
               }}
             >
               <div
                 style={{
                   width: "65px",
                   height: "65px",
                   borderRadius: "18px",
                   background: category.iconColor,
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   fontSize: "32px",
                   boxShadow: "0 5px 12px rgba(0,0,0,0.10)",
                   flexShrink: 0,
                 }}
               >
                 {category.icon}
               </div>

               <h2
                 style={{
                   color: "#123579",
                   fontSize: "clamp(30px, 2.5vw, 42px)",
                   fontWeight: 900,
                   margin: 0,
                   textAlign: "center",
                 }}
               >
                 {category.name}
               </h2>
             </div>

             {/* LEVEL BUTTONS */}
             <div
               style={{
                 width: "100%",
                 display: "grid",
                 gridTemplateColumns:
                   "repeat(2, minmax(0, 1fr))",
                 gap: "12px",
               }}
             >
               {categoryLevels.map((level: any) => (
                 <a
                   key={level.id}
                   href={`/niveau/${level.slug}`}
                   style={{
                     background: "#ffffff",
                     color: "#123579",
                     minHeight: "55px",
                     padding: "12px",
                     borderRadius: "14px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     gap: "7px",
                     fontSize: "15px",
                     fontWeight: 900,
                     textDecoration: "none",
                     textAlign: "center",
                     border: "1px solid #dce7f5",
                     boxShadow:
                       "0 4px 10px rgba(18,51,122,0.07)",
                     boxSizing: "border-box",
                   }}
                 >
                   {level.name}

                   <span
                     style={{
                       color: category.iconColor,
                       fontSize: "18px",
                     }}
                   >
                     →
                   </span>
                 </a>
               ))}
             </div>
           </div>
         );
       })}
     </section>

     {/* FOOTER */}
     <footer
       style={{
         width: "100%",
         textAlign: "center",
         color: "#64748b",
         fontSize: "15px",
         padding: "25px 15px 40px",
         boxSizing: "border-box",
       }}
     >
       Association Massar pour l’Éducation et le Développement
     </footer>
   </main>
   ```

   );\
   }  

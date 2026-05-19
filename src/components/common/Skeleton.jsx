export function SkeletonText({width='100%'}){return <div className="skeleton skeleton-text" style={{width}}/>}
export function SkeletonTitle(){return <div className="skeleton skeleton-title"/>}
export function SkeletonCard(){return <div className="skeleton skeleton-card"/>}
export function SkeletonAvatar({size=48}){return <div className="skeleton skeleton-avatar" style={{width:size,height:size}}/>}
export function PageSkeleton(){return (
  <div className="page" style={{padding:16}}>
    <div className="skeleton skeleton-title"/><SkeletonText width="40%"/>
    <div style={{height:16}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
      {[1,2,3,4].map(i=><SkeletonCard key={i}/>)}
    </div>
  </div>
)}

connectionService.getRequests()
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.replace(
    'http://localhost:5000',
    'https://cofounder-matrimony-backend.onrender.com'
  );
};

const accept = async(id)=>{
 await connectionService.acceptRequest(id);
 loadRequests();
}

<button onClick={() => accept(request._id)}>
  Accept
</button>
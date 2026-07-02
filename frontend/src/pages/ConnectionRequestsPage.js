connectionService.getRequests()
const accept = async(id)=>{
 await connectionService.acceptRequest(id);
 loadRequests();
}

<button onClick={() => accept(request._id)}>
  Accept
</button>
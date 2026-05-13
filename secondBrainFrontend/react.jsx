import {React,useState,useEffect} from "react";
import axios from "axios";

export function App({pageNumber, itemsPerPage}) {
const [data,setData] = useState([]);
const [loading,setLoading] = useState(false);
const [error, setError] = useState(null);

async function fetchData() {
  setLoading(true);
  try{
    const response = await axios.get("http://localhost:3000/products", {
      params: {
        page:pageNumber,
        limit:itemsPerPage
      }

    });
    setData(response.data)  
  }
  catch(error){
    setError(error)
  }
  finally{
    setLoading(false);
  }

}

useEffect(() => {
    fetchData()
    return () => {
      console.log("unmounted")
    }
},[pageNumber,itemsPerPage])

return <div>
  {loading&& <p>Loading the products</p>}
  {!loading && error && <p>Error:{error.message}</p>}
    {
      data.map((value,index) => {
        return (
          <div key={value.id || index}>
          <p>Products Name:{value.name}</p>
          <p>Products Price:{value.price}</p>
          <p>Products Category:{value.category}</p>
          <p>Products Inventory:{value.inventory}</p>
      </div>
        )

      })
    }

</div>


}


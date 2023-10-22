import { useQuery, gql } from '@apollo/client';
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';

// GraphQL query to retrieve notices given a cursor

const GET_LATEST_NOTICE = gql`
  query latestNotice {
    notices(first: 1) {
      edges {
        node {
          payload
        }
      }
    }
  }
`;

function RenderNotices({onNoticeGenerated}) {
    const [noticeList, setNoticeList] = useState([]);
    const { loading, error, data } = useQuery(GET_LATEST_NOTICE, {pollInterval: 500});

    useEffect(() => {
        if (loading) {
          console.log("Loading notices");
        }
        if (error) {
          console.error(`Error querying Query Server: ${JSON.stringify(error)}`);
        }
    
        if (data) {
          const latestNotice = data.notices.edges[0];
    
          if (latestNotice) {
            const noticePayload = ethers.toUtf8String(latestNotice.node.payload);
            console.log(`Latest notice payload: ${noticePayload}`);
            onNoticeGenerated(noticePayload); // Call the callback function
          }
        }
      }, [data, onNoticeGenerated]);
    return null
    /*
    return (
        <div>
        <div>
            <h3>Loading Arena...fetching notices</h3>
        </div>
        <div>{console.log("REDNERING rendernotices ", onNoticeGenerated)}</div>
        </div>
    ); */
}

export default RenderNotices;

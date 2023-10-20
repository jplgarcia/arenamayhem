import { useQuery, gql } from '@apollo/client';
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';

// GraphQL query to retrieve notices given a cursor
const GET_NOTICES = gql`
    query notices($cursor: String) {
        notices (first: 10, after: $cursor) {   
        totalCount
        pageInfo {
            hasNextPage
            endCursor
        }
        edges {
            node {
                index
                input {
                    index
                }
                payload
                }
        }
    }
  }`;

function QueryNotices() {
    const [cursor, setCursor] = useState(null);
    const [noticeList, setNoticeList] = useState([]);

    // Retrieve notices every 500 ms
    const { loading, error, data } = useQuery(GET_NOTICES, {
        variables: { cursor },
        pollInterval: 500
    });
    // Check query status
    useEffect(() => {
        if (loading) {
            console.log("Loading notices")
        }
        if (error) {
            console.error(
                `Error querying Query Server : ${JSON.stringify(error)}`
            );
        }
    });

    // Check query result
    const length = data?.notices?.edges?.length;
    if (length) {
        // Update cursor so that next GraphQL poll retrieves only newer data
        console.log("notices found length: ", length)
        setCursor(data.notices.pageInfo.endCursor);   
    }

    // Render new notices
    const newNotices = data?.notices?.edges?.map(({ node }) => {
        // Render payload from notice
        const noticePayload = ethers.toUtf8String(node.payload);
        console.log(`Detected new notice : ${noticePayload}`);

        return (
            <div key={`${node.input.index}-${node.index}`}>
                <p>{noticePayload}</p>
            </div>
        );
    });

    // Concat new echoes with previous ones
    let noticeData = noticeList;
    if (newNotices && newNotices.length) {
        // Add new rendered echoes to stored data
        noticeData = noticeList.concat(newNotices);
        setNoticeList(noticeData);
    }
    return noticeData;
}

function RenderNotices() {
    return (
        <div>
            <h3>Notices</h3>
            <QueryNotices />
        </div>
    );
}

export default RenderNotices;

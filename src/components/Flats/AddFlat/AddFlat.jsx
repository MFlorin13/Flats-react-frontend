import React from 'react';
import FlatForm from '../FlatForm/FlatForm';

const AddFlat = () => {
  const refreshList = async () => {
  };

  return (
    <div>
      <div>
        <h1>Add New Property</h1>
        <FlatForm refreshList={refreshList} />
      </div>
    </div>
  );
};

export default AddFlat;

import React from 'react';
import FlatForm from '../FlatForm/FlatForm';

const AddFlat = () => {
  const refreshList = async () => {
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.title}>Add New Property</h1>
        <FlatForm refreshList={refreshList} />
      </div>
    </div>
  );
};

export default AddFlat;

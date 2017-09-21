const getHashFromWindowLocation = (type = 'q') => {
  const paramsArr = window.location.hash.split('/')
  if (paramsArr[0].includes('#')) {
    if (paramsArr[0].replace('#', '') === type) {
      return paramsArr[1]
    }
  }
  return null
}

export { getHashFromWindowLocation }

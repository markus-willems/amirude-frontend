import { getHashFromWindowLocation } from './'

describe('getHashFromWindowLocation', () => {
  const hashToGet = '123456789'
  it(`should be equal to ${hashToGet}`, () => {
    window.location.hash = `#q/${hashToGet}`
    expect(getHashFromWindowLocation('q')).toEqual(hashToGet)
  })
})

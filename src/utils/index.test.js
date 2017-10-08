import { getHashFromWindowLocation, getQuestionLength } from './'

describe('getHashFromWindowLocation', () => {
  const hashToGet = '123456789'
  it(`should be equal to ${hashToGet}`, () => {
    window.location.hash = `#q/${hashToGet}`
    expect(getHashFromWindowLocation('q')).toEqual(hashToGet)
  })
})

describe('getQuestionLength', () => {
  it('should return a length of 8', () => {
    const str = 'Hello 🐶!'
    expect(getQuestionLength(str)).toBe(8)
  })

  it('should return a length of 9', () => {
    const str = 'Hello ❤️!'
    expect(getQuestionLength(str)).toBe(9)
  })
})
